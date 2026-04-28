package com.example.demo.order.dto;

import com.example.demo.book.dto.BookDTOReduced;
import com.example.demo.cards.dto.ReducedCardDTO;
import com.example.demo.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO {

    private Long id;
    private LocalDateTime date;
    private UserDTO user;
    private ReducedCardDTO card;
    private List<BookDTOReduced> books;
    private BigDecimal totalPrice;

}
