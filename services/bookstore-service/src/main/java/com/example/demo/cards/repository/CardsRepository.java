package com.example.demo.cards.repository;

import com.example.demo.cards.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CardsRepository extends JpaRepository<Card,Long> {
    Optional<Card> findByCardNumber(String cardNumber);
}
