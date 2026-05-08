package com.example.demo.order.service;

import com.example.demo.book.model.Book;
import com.example.demo.book.service.BookServiceImpl;
import com.example.demo.cartitem.model.CartItem;
import com.example.demo.configuration.CurrentUserUtils;
import com.example.demo.exceptions.InsufficientStockException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.order.dto.CreateOrderDTO;
import com.example.demo.order.dto.OrderDTO;
import com.example.demo.order.dto.UpdateOrderDTO;
import com.example.demo.order.event.OrderPlacedEvent;
import com.example.demo.order.model.Order;
import com.example.demo.order.model.OrderStatus;
import com.example.demo.order.model.PaymentMethod;
import com.example.demo.order.repository.OrderRepository;
import com.example.demo.user.model.User;
import com.example.demo.user.service.UserServiceImpl;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import jakarta.transaction.Transactional;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    private final Environment env;
    private final String emailApiKey;
    private final OrderRepository repository;
    private final UserServiceImpl userService;
    private final BookServiceImpl bookService;
    private final OrderEventProducer orderEventProducer;

    public OrderServiceImpl(OrderRepository repository, UserServiceImpl userService , BookServiceImpl bookService, Environment env, OrderEventProducer orderEventProducer) {
        this.orderEventProducer = orderEventProducer;
        this.repository = repository;
        this.userService = userService;
        this.bookService = bookService;

        this.env = env;
        this.emailApiKey = this.env.getProperty("sendgrid.api.key");
    }

    @Override
    public List<OrderDTO> getAll() {
        try{
            User currentUser = userService.getCurrentUser();
            return repository.findAllByUserId(currentUser.getId())
                    .stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (NotFoundException e) {
            org.slf4j.LoggerFactory.getLogger(OrderServiceImpl.class).error("[OrderService] getAll failed: {}", e.getMessage());
        }
        return List.of();
    }

    @Override
    public Optional<OrderDTO> getById(Long id) {
        Optional<Order> order = repository.findById(id);
        if (order.get().getUser().getName().equals(CurrentUserUtils.getUsername())) {
            return order.map(this::convertToDTO);
        } else {
            return Optional.empty();
        }
    }

    @Override
    @Transactional
    public OrderDTO createOrder(PaymentMethod paymentMethod) throws NotFoundException, InsufficientStockException, IOException {
        User user = userService.getCurrentUser();
        List<CartItem> cartItems = user.getCartItems();

        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cannot create order with an empty cart");
        }

        BigDecimal total = cartItems.stream()
                .map(item -> item.getBook().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Book> booksForOrder = new ArrayList<>();
        for (CartItem item : cartItems) {
            for (int i = 0; i < item.getQuantity(); i++) {
                booksForOrder.add(item.getBook());
            }
        }

        OrderStatus status = paymentMethod == PaymentMethod.CRYPTO
                ? OrderStatus.AWAITING_PAYMENT
                : OrderStatus.PENDING;

        Order newOrder = Order.builder()
                .date(LocalDateTime.now())
                .user(user)
                .books(booksForOrder)
                .status(status)
                .totalPrice(total)
                .paymentMethod(paymentMethod)
                .build();
        Order savedOrder = repository.save(newOrder);
        bookService.updateStock(cartItems);
        userService.emptyCart();

        OrderPlacedEvent event = new OrderPlacedEvent(
                savedOrder.getId(),
                savedOrder.getTotalPrice(),
                user.getName(),
                paymentMethod
        );
        orderEventProducer.sendOrderEvent(event);
        return convertToDTO(savedOrder);
    }



    @Override
    public boolean deleteOrder(Long id) {
        Optional<Order> order = repository.findById(id);
        if (order.isPresent()) {
            repository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    @Override
    public Optional<OrderDTO> updateOrder(Long id, UpdateOrderDTO updateOrderDTO) {
        return repository.findById(id)
                .map(existing -> {
                    if (updateOrderDTO.getDate() != null) {
                        existing.setDate(updateOrderDTO.getDate());
                    }
                    if (updateOrderDTO.getUser() != null) {
                        existing.setUser(updateOrderDTO.getUser());
                    }
                    if (updateOrderDTO.getBooks() != null) {
                        existing.setBooks(updateOrderDTO.getBooks());
                    }
                    Order order = repository.save(existing);
                    return convertToDTO(order);
                });
    }

    @Override
    public void sendOrderEmail(String userEmail, String htmlDetails) throws IOException {

        Email sender = new Email("ezereding420@gmail.com");
        Email addressee = new Email(userEmail);
        Content details = new Content("text/html", htmlDetails);

        Mail mail = new Mail(sender, "Order created:", addressee, details);

        SendGrid sg = new SendGrid(emailApiKey);
        Request request = new Request();

        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            System.out.println("Status: " + response.getStatusCode());
            System.out.println("Body: " + response.getBody());
            System.out.println("Headers: " + response.getHeaders());
        } catch (IOException e) {
            throw e;
        }
    }

    @Override
    public Order convertToEntity(CreateOrderDTO createOrderDTO) {
        BigDecimal total = createOrderDTO.getBooks().stream()
                .map(Book::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        com.example.demo.order.model.OrderStatus status = createOrderDTO.getPaymentMethod() == com.example.demo.order.model.PaymentMethod.CRYPTO
                ? com.example.demo.order.model.OrderStatus.AWAITING_PAYMENT
                : com.example.demo.order.model.OrderStatus.PENDING;

        return Order.builder()
                .date(createOrderDTO.getDate())
                .user(createOrderDTO.getUser())
                .books(createOrderDTO.getBooks())
                .status(status)
                .totalPrice(total)
                .paymentMethod(createOrderDTO.getPaymentMethod())
                .build();
    }

    @Override
    public OrderDTO convertToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .date(order.getDate())
                .user(userService.convertToDTO(order.getUser()))
                .books(order.getBooks().stream()
                        .map(bookService::reduceBook)
                        .collect(Collectors.toList()))
                .totalPrice(order.getTotalPrice())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus() != null ? order.getStatus().name() : null)
                .expiresAt(order.getExpiresAt())
                .build();
    }
}
