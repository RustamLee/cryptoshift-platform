package com.example.demo.order.dto;
import com.example.demo.book.model.Book;
import com.example.demo.cards.model.Card;
import com.example.demo.user.model.User;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderDTO {

    @NotNull(message = "The date of order cannot be null")
    private LocalDateTime date;
    @NotNull(message = "The linked client can't be null")
    private User user;
    @NotNull(message = "The linked card can't be null")
    private Card card;
    @NotNull(message = "The book list cannot be null")
    private List<Book> books;

}
