package com.example.demo.cards.controler;

import com.example.demo.cards.dto.CardDTO;
import com.example.demo.cards.dto.CreateCardDTO;
import com.example.demo.cards.dto.UpdateCardDTO;
import com.example.demo.cards.service.CardServiceImpl;
import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.UnautorizedException;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cards")
public class CardsControler {

    private final CardServiceImpl cardService;

    public CardsControler(CardServiceImpl cardService) {
        this.cardService = cardService;
    }


    @GetMapping
    public ResponseEntity<List<CardDTO>> getAllcards () {
        List<CardDTO> cards = cardService.getAll();
        return ResponseEntity.ok(cards);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CardDTO> getCardById (@PathVariable Long id) {
        try {
            Optional<CardDTO> card = cardService.getById(id);
            return card.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (UnautorizedException e) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping
    public ResponseEntity<CardDTO> createCard(@Valid @RequestBody CreateCardDTO createCardDTO){
        try {
            CardDTO cardDTO = cardService.createCard(createCardDTO);
            return new ResponseEntity<>(cardDTO, HttpStatus.CREATED);
        } catch (AlreadyExistingException | NotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_ACCEPTABLE);
        }

    }

    @PutMapping("/{id}")
    public ResponseEntity<CardDTO> updateCard(@PathVariable Long id,@Valid @RequestBody UpdateCardDTO updateCardDTO){
        try{
            Optional<CardDTO> updatedCard = cardService.updateCard(id, updateCardDTO);
            return updatedCard.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }catch (UnautorizedException e){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteCard(@PathVariable Long id) {
        try {
            boolean deleted = cardService.deleteCard(id);
            if (deleted){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }else{
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Esta tarjeta tiene un pedido pagado. No se puede eliminar.");
        } catch (UnautorizedException e){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

    }
}
