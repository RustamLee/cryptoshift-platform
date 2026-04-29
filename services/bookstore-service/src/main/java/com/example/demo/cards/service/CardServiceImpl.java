package com.example.demo.cards.service;

import com.example.demo.cards.dto.CardDTO;
import com.example.demo.cards.dto.CreateCardDTO;
import com.example.demo.cards.dto.ReducedCardDTO;
import com.example.demo.cards.dto.UpdateCardDTO;
import com.example.demo.cards.model.Card;
import com.example.demo.cards.repository.CardsRepository;
import com.example.demo.configuration.CurrentUserUtils;
import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.UnautorizedException;
import com.example.demo.user.model.User;
import com.example.demo.user.service.UserServiceImpl;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CardServiceImpl implements CardService{

    private final CardsRepository repository;
    private final UserServiceImpl userService;

    public CardServiceImpl(CardsRepository repository, UserServiceImpl userService) {
        this.repository = repository;
        this.userService = userService;
    }

    @Override
    public List<CardDTO> getAll() {
        try{
        User currentUser = userService.getCurrentUser();
        LoggerFactory.getLogger(CardServiceImpl.class).debug("[CardService] getAll called, CurrentUserUtils.getUsername()='{}'", currentUser.getId());
        return repository.findAllByOwnerId(currentUser.getId())
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        }catch (NotFoundException e){
            LoggerFactory.getLogger(CardServiceImpl.class).error("[CardService] getAll failed: {}", e.getMessage());
        }
        return List.of();
    }

    @Override
    public Optional<CardDTO> getById(Long id) throws UnautorizedException {
        Optional<Card> card = repository.findById(id);
        if (card.isPresent() && !card.get().getOwner().getName().equals(CurrentUserUtils.getUsername())){
            throw new UnautorizedException("No esta autorizado para realizar esta acicon");
        }
        return card.map(this::convertToDTO);
    }

    public Optional<Card> getByIdNumber(Long id){
        return repository.findById(id);
    }


    @Override
    public CardDTO createCard(CreateCardDTO createCardDTO) throws AlreadyExistingException, NotFoundException {
        Card newCard = convertToEntity(createCardDTO);
        User user =userService.getCurrentUser();
        newCard.setOwner(user);

        if (repository.findAll().contains(newCard)){
            throw new AlreadyExistingException("La tarjeta ya existe");
        }
        Card savedCard = repository.save(newCard);
        return convertToDTO(savedCard);
    }

    @Override
    public boolean deleteCard(Long id) throws UnautorizedException {
        Optional<Card> card = repository.findById(id);
        if (card.isPresent() && !card.get().getOwner().getName().equals(CurrentUserUtils.getUsername())){
            throw new UnautorizedException("No esta autorizado para realizar esta acicon");
        }
        if (card.isPresent()){
            if (card.get().getOrders() != null && !card.get().getOrders().isEmpty()) {
                throw new IllegalStateException("Esta tarjeta tiene un pedido pagado. No se puede eliminar.");
            }
            repository.deleteById(id);
            return true;
        }else {
            return false;
        }
    }

    @Override
    public Optional<CardDTO> updateCard(Long id, UpdateCardDTO updateCardDTO) throws UnautorizedException {
        Optional<Card> card = repository.findById(id);
        if (card.isPresent() && !card.get().getOwner().getName().equals(CurrentUserUtils.getUsername())){
            throw new UnautorizedException("No esta autorizado para realizar esta acicon");
        }
        return repository.findById(id)
                .map(existing ->{
                    if (updateCardDTO.getCardNumber() != null){
                        existing.setCardNumber(updateCardDTO.getCardNumber());
                    }
                    if (updateCardDTO.getBank() != null){
                        existing.setBank(updateCardDTO.getBank());
                    }
                    if (updateCardDTO.getCvv() != null){
                        existing.setCvv(updateCardDTO.getCvv());
                    }
                    if (updateCardDTO.getOwner() != null){
                        existing.setOwner(updateCardDTO.getOwner());
                    }
                    Card saved = repository.save(existing);
                    return convertToDTO(saved);
                });
    }

    @Override
    public Card convertToEntity(CreateCardDTO createCardDTO) {
        return Card.builder()
                .cardNumber(createCardDTO.getCardNumber())
                .bank(createCardDTO.getBank())
                .cvv(createCardDTO.getCvv())
                .owner(createCardDTO.getOwner())
                .build();
    }

    @Override
    public CardDTO convertToDTO(Card card) {
        return new CardDTO(card.getId(),card.getCardNumber(),card.getBank(),card.getCvv(),userService.convertToDTO(card.getOwner()));
    }

    public ReducedCardDTO reduceCard(Card card){
        return new ReducedCardDTO(card.getId(), card.getCardNumber(), card.getBank());
    }
}
