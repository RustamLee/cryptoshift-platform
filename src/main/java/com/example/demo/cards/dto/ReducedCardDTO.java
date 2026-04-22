package com.example.demo.cards.dto;

public class ReducedCardDTO {
    private Long id;
    private String cardNumber;
    private String bank;

    public ReducedCardDTO(Long id, String cardNumber, String bank) {
        this.id = id;
        this.cardNumber = cardNumber;
        this.bank = bank;
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
}
