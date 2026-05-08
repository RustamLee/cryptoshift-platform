package com.example.demo.order.dto;

import com.example.demo.book.dto.BookDTOReduced;
import com.example.demo.order.model.PaymentMethod;
import com.example.demo.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO {

    private Long id;
    private LocalDateTime date;
    private UserDTO user;
    private List<BookDTOReduced> books;
    private BigDecimal totalPrice;
    private PaymentMethod paymentMethod;
    private String status;
    private LocalDateTime expiresAt;
}
