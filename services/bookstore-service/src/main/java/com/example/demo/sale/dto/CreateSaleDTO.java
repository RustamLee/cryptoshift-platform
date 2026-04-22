package com.example.demo.sale.dto;
import com.example.demo.book.model.Book;
import com.example.demo.cards.model.Card;
import com.example.demo.user.model.User;
import jakarta.validation.constraints.NotNull;

import java.sql.Date;
import java.util.List;
import java.util.Objects;

public class CreateSaleDTO {

    @NotNull(message = "The date of sale cannot be null")
    private Date date;
    @NotNull(message = "The linked client can't be null")
    private User user;
    @NotNull(message = "The linked card can't be null")
    private Card card;
    @NotNull(message = "The book list cannot be null")
    private List<Book> books;

    public CreateSaleDTO(Date date, User user, Card card, List<Book> books) {
        this.date = date;
        this.user = user;
        this.card = card;
        this.books = books;
    }

    public CreateSaleDTO() {
    }

    public @NotNull(message = "The date of sale cannot be null") Date getDate() {
        return date;
    }

    public void setDate(@NotNull(message = "The date of sale cannot be null") Date date) {
        this.date = date;
    }

    public @NotNull(message = "The linked client can't be null") User getUser() {
        return user;
    }

    public void setUser(@NotNull(message = "The linked client can't be null") User user) {
        this.user = user;
    }

    public @NotNull(message = "The linked card can't be null") Card getCard() {
        return card;
    }

    public void setCard(@NotNull(message = "The linked card can't be null") Card card) {
        this.card = card;
    }

    public @NotNull(message = "The book list cannot be null") List<Book> getBooks() {
        return books;
    }

    public void setBooks(@NotNull(message = "The book list cannot be null") List<Book> books) {
        this.books = books;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CreateSaleDTO that = (CreateSaleDTO) o;
        return Objects.equals(date, that.date) && Objects.equals(user, that.user) && Objects.equals(card, that.card) && Objects.equals(books, that.books);
    }

    @Override
    public int hashCode() {
        return Objects.hash(date, user, card, books);
    }

    @Override
    public String toString() {
        return "CreateSaleDTO{" +
                "date=" + date +
                ", user=" + user +
                ", card=" + card +
                ", books=" + books +
                '}';
    }
}
