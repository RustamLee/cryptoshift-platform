package com.example.demo.book.model;

import com.example.demo.author.model.Author;
import com.example.demo.genre.model.Genre;
import com.example.demo.sale.model.Sale;
import com.example.demo.sellerprofile.model.SellerProfile;
import com.example.demo.user.model.User;
import jakarta.persistence.*;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Table (name = "books")
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Long stock;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Author author;

    @ManyToMany
    @JoinTable(
            name = "books_genres",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres;

    @ManyToMany(mappedBy = "books")
    private List<Sale> sales;

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private SellerProfile seller;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column
    private Boolean available = true;

    @ManyToMany(mappedBy = "cart")
    private List<User> cartUser;

    public Book(Long id, String name, String description, Double price, Long stock, Author author,
                Set<Genre> genres, List<Sale> sales, SellerProfile seller, List<User> cartUser) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
        this.genres = genres;
        this.sales = sales;
        this.seller = seller;
        this.cartUser = cartUser;
    }

    public Book(String name, String description, Double price, Long stock, Author author, Set<Genre> genres,
                List<Sale> sales, SellerProfile seller, List<User> cartUser) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
        this.genres = genres;
        this.sales = sales;
        this.seller = seller;
        this.cartUser = cartUser;
    }

    public Book(String name, String description, Double price, Long stock, Author author,
                Set<Genre> genres, SellerProfile seller) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
        this.genres = genres;
        this.seller = seller;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Book() {
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getStock() {
        return stock;
    }

    public void setStock(Long stock) {
        this.stock = stock;
    }

    public Author getAuthor() {
        return author;
    }

    public void setAuthor(Author author) {
        this.author = author;
    }

    public Set<Genre> getGenres() {
        return genres;
    }

    public void setGenres(Set<Genre> genres) {
        this.genres = genres;
    }

    public List<Sale> getSales() {
        return sales;
    }

    public void setSales(List<Sale> sales) {
        this.sales = sales;
    }

    public SellerProfile getSeller() {
        return seller;
    }

    public void setSeller(SellerProfile seller) {
        this.seller = seller;
    }

    public List<User> getCartUser() {
        return cartUser;
    }

    public void setCartUser(List<User> cartUser) {
        this.cartUser = cartUser;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Book book = (Book) o;
        return Objects.equals(name, book.name) && Objects.equals(description, book.description) && Objects.equals(author, book.author) && Objects.equals(genres, book.genres);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, description, price, author);
    }

    @Override
    public String toString() {
        return "Book{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", stock=" + stock +
                ", author=" + author +
                ", genres=" + genres +
                '}';
    }
}
