package com.example.demo.cards.dto;

import com.example.demo.user.dto.UserDTO;
import java.util.Objects;

public class CardDTO {

    private Long id;
    private String cardNumber;
    private String bank;
    private String cvv;
    private UserDTO owner;

    public CardDTO(Long id, String cardNumber, String bank, String cvv, UserDTO owner) {
        this.id = id;
        this.cardNumber = cardNumber;
        this.bank = bank;
        this.cvv = cvv;
        this.owner = owner;
    }

    public CardDTO(String cardNumber, String bank, String cvv, UserDTO owner) {
        this.cardNumber = cardNumber;
        this.bank = bank;
        this.cvv = cvv;
        this.owner = owner;
    }

    public CardDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCardNumber() {
        return cardNumber;
    }

    public void setCardNumber(String cardNumber) {
        this.cardNumber = cardNumber;
    }

    public String getBank() {
        return bank;
    }

    public void setBank(String bank) {
        this.bank = bank;
    }

    public String getCvv() {
        return cvv;
    }

    public void setCvv(String cvv) {
        this.cvv = cvv;
    }

    public UserDTO getOwner() {
        return owner;
    }

    public void setOwner(UserDTO owner) {
        this.owner = owner;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CardDTO cardDTO = (CardDTO) o;
        return  Objects.equals(cardNumber, cardDTO.cardNumber) && Objects.equals(bank, cardDTO.bank)
                && Objects.equals(cvv, cardDTO.cvv) && Objects.equals(owner, cardDTO.owner);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, cardNumber, bank, cvv, owner);
    }

    @Override
    public String toString() {
        return "CardDTO{" +
                "id=" + id +
                ", cardNumber='" + cardNumber + '\'' +
                ", Bank='" + bank + '\'' +
                ", owner=" + owner +
                '}';
    }
}