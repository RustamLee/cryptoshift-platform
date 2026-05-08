package com.example.demo.cartitem.repository;

import com.example.demo.cartitem.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByUserIdAndBookId(Long userId, Long bookId);

    List<CartItem> findAllByUserId(Long userId);
}
