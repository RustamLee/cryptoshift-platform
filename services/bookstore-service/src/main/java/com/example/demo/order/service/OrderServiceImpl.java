package com.example.demo.order.service;

import com.example.demo.book.model.Book;
import com.example.demo.book.service.BookServiceImpl;
import com.example.demo.cards.model.Card;
import com.example.demo.cards.service.CardServiceImpl;
import com.example.demo.configuration.CurrentUserUtils;
import com.example.demo.exceptions.InsufficientStockException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.order.dto.CreateOrderDTO;
import com.example.demo.order.dto.OrderDTO;
import com.example.demo.order.dto.UpdateOrderDTO;
import com.example.demo.order.event.OrderPlacedEvent;
import com.example.demo.order.model.Order;
import com.example.demo.order.model.OrderStatus;
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
import java.sql.Date;
import java.time.LocalDate;
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
    private final CardServiceImpl cardService;
    private final BookServiceImpl bookService;
    private final OrderEventProducer orderEventProducer;

    public OrderServiceImpl(OrderRepository repository, UserServiceImpl userService, CardServiceImpl cardService, BookServiceImpl bookService, Environment env, OrderEventProducer orderEventProducer) {
        this.orderEventProducer = orderEventProducer;
        this.repository = repository;
        this.userService = userService;
        this.cardService = cardService;
        this.bookService = bookService;

        this.env = env;
        this.emailApiKey = this.env.getProperty("sendgrid.api.key");
    }

    @Override
    public List<OrderDTO> getAll() {
        String current = CurrentUserUtils.getUsername();
        org.slf4j.LoggerFactory.getLogger(OrderServiceImpl.class).debug("[OrderService] getAll called, CurrentUserUtils.getUsername()='{}'", current);
        return repository.findAll().stream().filter(order -> {
            try {
                return order.getUser() != null && order.getUser().getName().equals(current);
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(OrderServiceImpl.class).warn("[OrderService] error checking order user", e);
                return false;
            }
        }).map(this::convertToDTO).collect(Collectors.toList());
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
    public OrderDTO createOrder(Long cardId) throws NotFoundException, InsufficientStockException, IOException {
        User user = userService.getCurrentUser();
        List<Book> cart = new ArrayList<>(user.getCart());

        if(cart.isEmpty()){
            throw new IllegalStateException("Cannot сreate order with an empty cart");
        }

        Optional<Card> card = cardService.getByIdNumber(cardId);

        if (card.isPresent() && user.getCards().contains(card.get())) {

            cart.forEach(b -> org.slf4j.LoggerFactory.getLogger(OrderServiceImpl.class)
                    .info("Book in cart: ID={}, Name={}, Price={}", b.getId(), b.getName(), b.getPrice()));

            BigDecimal total = cart.stream()
                    .map(Book::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Order newOrder = Order.builder()
                    .date(Date.valueOf(LocalDate.now()))
                    .user(user)
                    .card(card.get())
                    .books(cart)
                    .status(OrderStatus.PENDING)
                    .totalPrice(total)
                    .build();

            Order savedOrder = repository.save(newOrder);

            bookService.updateStock(user.getCart());
            userService.emptyCart();

            OrderPlacedEvent event = new OrderPlacedEvent(
                    savedOrder.getId(),
                    savedOrder.getTotalPrice(),
                    user.getName()
            );
            orderEventProducer.sendOrderEvent(event);

            return convertToDTO(savedOrder);
        } else {
            throw new NotFoundException("Card not found or does not belong to user");
        }
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
                    if (updateOrderDTO.getCard() != null) {
                        existing.setCard(updateOrderDTO.getCard());
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

        return Order.builder()
                .date(createOrderDTO.getDate())
                .user(createOrderDTO.getUser())
                .card(createOrderDTO.getCard())
                .books(createOrderDTO.getBooks())
                .status(OrderStatus.PENDING)
                .totalPrice(total)
                .build();
    }

    @Override
    public OrderDTO convertToDTO(Order order) {
        return new OrderDTO(
                order.getId(),
                order.getDate(),
                userService.convertToDTO(order.getUser()),
                cardService.reduceCard(order.getCard()),
                order.getBooks().stream().map(bookService::reduceBook).collect(Collectors.toList()),
                order.getTotalPrice()
        );
    }

    public OrderDTO confirmOrder(Long orderId) throws NotFoundException, IOException {
        Order order = repository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.PAID) {
            return convertToDTO(order);
        }

        order.setStatus(OrderStatus.PAID);
        Order savedOrder = repository.save(order);

        BigDecimal total = savedOrder.getTotalPrice();

        sendOrderEmail(order.getUser().getName(), "<h1>Gracias por su compra</h1><p>Detalles de la compra:</p><ul>" +
                savedOrder.getBooks().stream()
                        .map(book -> "<li>" + book.getName() + " - $" + book.getPrice() + "</li>")
                        .collect(Collectors.joining()) +
                "</ul><p>Total: $" + total.toPlainString() + "</p>");

        return convertToDTO(savedOrder);
    }


}
