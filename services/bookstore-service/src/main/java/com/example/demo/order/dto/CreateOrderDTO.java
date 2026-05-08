package com.example.demo.order.dto;
import com.example.demo.book.model.Book;
import com.example.demo.order.model.PaymentMethod;
import com.example.demo.user.model.User;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderDTO {
    @NotNull(message = "The date of order cannot be null")
    private LocalDateTime date;
    @NotNull(message = "The linked client can't be null")
    private User user;
    @NotNull(message = "The book list cannot be null")
    private List<Book> books;
    @NotNull(message = "The payment method cannot be null")
    private PaymentMethod paymentMethod;
}
