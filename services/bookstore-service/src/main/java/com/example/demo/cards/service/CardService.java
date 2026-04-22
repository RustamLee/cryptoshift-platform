package com.example.demo.cards.service;

import com.example.demo.cards.dto.CardDTO;
import com.example.demo.cards.dto.CreateCardDTO;
import com.example.demo.cards.dto.UpdateCardDTO;
import com.example.demo.cards.model.Card;
import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.UnautorizedException;

import java.util.List;
import java.util.Optional;

public interface CardService {
    Optional<CardDTO> getById(Long id) throws UnautorizedException;
    List<CardDTO> getAll();
    CardDTO createCard(CreateCardDTO createCardDTO) throws AlreadyExistingException, NotFoundException;
    Optional<CardDTO> updateCard (Long id, UpdateCardDTO updateCardDTO) throws UnautorizedException;
    boolean deleteCard(Long id) throws UnautorizedException;

    Card convertToEntity(CreateCardDTO createCardDTO);
    CardDTO convertToDTO(Card card);
}
