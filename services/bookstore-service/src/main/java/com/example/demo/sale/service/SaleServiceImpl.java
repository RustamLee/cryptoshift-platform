package com.example.demo.sale.service;

import com.example.demo.book.model.Book;
import com.example.demo.book.service.BookServiceImpl;
import com.example.demo.cards.model.Card;
import com.example.demo.cards.service.CardServiceImpl;
import com.example.demo.configuration.CurrentUserUtils;
import com.example.demo.exceptions.InsufficientStockException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.sale.dto.CreateSaleDTO;
import com.example.demo.sale.dto.SaleDTO;
import com.example.demo.sale.dto.UpdateSaleDTO;
import com.example.demo.sale.model.Sale;
import com.example.demo.sale.repository.SaleRepository;
import com.example.demo.user.model.User;
import com.example.demo.user.service.UserServiceImpl;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SaleServiceImpl implements SaleService{

    private final Environment env;
    private final String emailApiKey;
    private final SaleRepository repository;
    private final UserServiceImpl userService;
    private final CardServiceImpl cardService;
    private final BookServiceImpl bookService;

    public SaleServiceImpl(SaleRepository repository, UserServiceImpl userService, CardServiceImpl cardService, BookServiceImpl bookService, Environment env) {
        this.repository = repository;
        this.userService = userService;
        this.cardService = cardService;
        this.bookService = bookService;
        this.env = env;
        this.emailApiKey = this.env.getProperty("sendgrid.api.key");
    }

    @Override
    public List<SaleDTO> getAll() {
        String current = CurrentUserUtils.getUsername();
        org.slf4j.LoggerFactory.getLogger(SaleServiceImpl.class).debug("[SaleService] getAll called, CurrentUserUtils.getUsername()='{}'", current);
        return repository.findAll().stream().filter(sale -> {
            try {
                return sale.getUser() != null && sale.getUser().getName().equals(current);
            } catch (Exception e) {
                org.slf4j.LoggerFactory.getLogger(SaleServiceImpl.class).warn("[SaleService] error checking sale user", e);
                return false;
            }
        }).map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<SaleDTO> getById(Long id) {
        Optional<Sale> sale = repository.findById(id);
        if (sale.get().getUser().getName().equals(CurrentUserUtils.getUsername())){
            return sale.map(this::convertToDTO);
        }else{
            return Optional.empty();
        }
    }

    @Override
    public SaleDTO createSale(Long id) throws NotFoundException, InsufficientStockException, IOException{
        User user = userService.getCurrentUser();
        Optional<Card> card = cardService.getByIdNumber(id);

        if(card.isPresent() && user.getCards().contains(card.get())){
            List<Book> cart = new ArrayList<>(user.getCart());

            Sale newSale = new Sale(Date.valueOf(LocalDate.now()),user,card.get(),cart);
            Sale savedSale = repository.save(newSale);
            bookService.updateStock(user.getCart());

            userService.emptyCart();

            double total = 0;
            for(Book book : savedSale.getBooks()){
                total += book.getPrice();
            }

            String template = Files.readString(Paths.get("src/main/resources/templates/email-de-compra-exitosa.html"));

            String booksList = savedSale.getBooks().stream()
                    .map(book -> "<li>" + book.getName() + " - $" + book.getPrice() + "</li>")
                    .collect(Collectors.joining());

            String htmlDetails = template
                    .replace("{{orderId}}", String.valueOf(savedSale.getId()))
                    .replace("{{total}}", String.valueOf(total))
                    .replace("{{books}}", booksList);

            sendSaleEmail(user.getName(), htmlDetails);
            return convertToDTO(savedSale);
        }else {
            throw new NotFoundException("La tarjeta no esta registrada");
        }
    }

    @Override
    public boolean deleteSale(Long id) {
        Optional<Sale> sale = repository.findById(id);
        if (sale.isPresent()){
            repository.deleteById(id);
            return true;
        }else {
            return false;
        }
    }

    @Override
    public Optional<SaleDTO> updateSale(Long id, UpdateSaleDTO updateSaleDTO) {
        return repository.findById(id)
                .map(existing ->{
                    if (updateSaleDTO.getDate() != null){
                        existing.setDate(updateSaleDTO.getDate());
                    }
                    if (updateSaleDTO.getUser() != null){
                        existing.setUser(updateSaleDTO.getUser());
                    }
                    if (updateSaleDTO.getCard() != null){
                        existing.setCard(updateSaleDTO.getCard());
                    }
                    if (updateSaleDTO.getBooks() != null){
                        existing.setBooks(updateSaleDTO.getBooks());
                    }
                    Sale sale = repository.save(existing);
                    return convertToDTO(sale);
                });
    }

    @Override
    public void sendSaleEmail(String userEmail, String htmlDetails) throws IOException{

        Email sender = new Email("ezereding420@gmail.com");
        Email addressee = new Email(userEmail);
        Content details = new Content("text/html", htmlDetails);

        Mail mail = new Mail(sender, "Compra realizada", addressee, details);

        SendGrid sg = new SendGrid(emailApiKey);
        Request request = new Request();

        try{
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sg.api(request);

            System.out.println("Status: " + response.getStatusCode());
            System.out.println("Body: " + response.getBody());
            System.out.println("Headers: " + response.getHeaders());
        }catch (IOException e){
            throw e;
        }
    }

    @Override
    public Sale convertToEntity(CreateSaleDTO createSaleDTO) {
        return new Sale(createSaleDTO.getDate(),createSaleDTO.getUser(),createSaleDTO.getCard(),createSaleDTO.getBooks());
    }

    @Override
    public SaleDTO convertToDTO(Sale sale) {
        return new SaleDTO(sale.getId(),sale.getDate(),userService.convertToDTO(sale.getUser()),cardService.reduceCard(sale.getCard()),sale.getBooks().stream().map(bookService::reduceBook).collect(Collectors.toList()));
    }


}
