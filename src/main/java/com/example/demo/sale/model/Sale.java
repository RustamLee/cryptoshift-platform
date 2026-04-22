package com.example.demo.sale.model;

import com.example.demo.book.model.Book;
import com.example.demo.cards.model.Card;
import com.example.demo.user.model.User;
import jakarta.persistence.*;

import java.sql.Date;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Date date;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "card_id")
    private Card card;

    @ManyToMany
    @JoinTable(
            name = "sales_books",
            joinColumns = @JoinColumn(name = "sale_id"),
            inverseJoinColumns = @JoinColumn(name = "book_id")
    )
    private List<Book> books;

    public Sale(Long id, Date date, User user, Card card, List<Book> books) {
        this.id = id;
        this.date = date;
        this.user = user;
        this.card = card;
        this.books = books;
    }

    public Sale(Date date, User user, Card card, List<Book> books) {
        this.date = date;
        this.user = user;
        this.card = card;
        this.books = books;
    }

    public Sale() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
        Sale sale = (Sale) o;
        return Objects.equals(date, sale.date) && Objects.equals(user, sale.user) && Objects.equals(card, sale.card) && Objects.equals(books, sale.books);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, date, user, card, books);
    }

    @Override
    public String toString() {
        return "Sale{" +
                "id=" + id +
                ", date=" + date +
                ", user=" + user +
                ", card=" + card +
                ", books=" + books +
                '}';
    }
}
