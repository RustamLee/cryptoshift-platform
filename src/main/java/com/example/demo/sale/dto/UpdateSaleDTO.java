package com.example.demo.sale.dto;

import com.example.demo.book.model.Book;
import com.example.demo.cards.model.Card;
import com.example.demo.user.model.User;
import java.sql.Date;
import java.util.List;
import java.util.Objects;

public class UpdateSaleDTO {

    private Date date;
    private User user;
    private Card card;
    private List<Book> books;

    public UpdateSaleDTO(Date date, User user, Card card, List<Book> books) {
        this.date = date;
        this.user = user;
        this.card = card;
        this.books = books;
    }

    public UpdateSaleDTO() {
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }

    public List<Book> getBooks() {
        return books;
    }

    public void setBooks(List<Book> books) {
        this.books = books;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UpdateSaleDTO that = (UpdateSaleDTO) o;
        return Objects.equals(date, that.date) && Objects.equals(user, that.user) && Objects.equals(card, that.card) && Objects.equals(books, that.books);
    }

    @Override
    public int hashCode() {
        return Objects.hash(date, user, card, books);
    }

    @Override
    public String toString() {
        return "UpdateSaleDTO{" +
                "date=" + date +
                ", user=" + user +
                ", card=" + card +
                ", books=" + books +
                '}';
    }
}
