package com.example.demo.cartitem.dto;

import com.example.demo.book.dto.BookDTOReduced;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDTO {
    private Long id;
    private BookDTOReduced book;
    private Integer quantity;
}
