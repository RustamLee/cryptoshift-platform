package com.example.demo.order.dto;

import com.example.demo.book.model.Book;
import com.example.demo.order.model.PaymentMethod;
import com.example.demo.user.model.User;
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
public class UpdateOrderDTO {

    private LocalDateTime date;
    private User user;
    private List<Book> books;
    private PaymentMethod paymentMethod;

}
