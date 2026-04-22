package com.example.demo.book.dto;

import com.example.demo.author.dto.AuthorDTOReduced;
import com.example.demo.genre.dto.GenreDTO;
import java.util.Set;

public class BookDTOReduced {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Long stock;
    private AuthorDTOReduced author;
    private Set<GenreDTO> genres;
    private String imageUrl;

    public BookDTOReduced(Long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    public BookDTOReduced(Long id, String name, String description, Double price, Long stock) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
    }

    public BookDTOReduced(Long id, String name, String description, Double price, Long stock, AuthorDTOReduced author) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
    }

    public BookDTOReduced(Long id, String name, String description, Double price, Long stock, AuthorDTOReduced author, String imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
        this.imageUrl = imageUrl;
    }

    public BookDTOReduced(Long id, String name, String description, Double price, Long stock, AuthorDTOReduced author, Set<GenreDTO> genres, String imageUrl) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
        this.genres = genres;
        this.imageUrl = imageUrl;
    }

    public BookDTOReduced(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public BookDTOReduced(String name, String description, Double price, Long stock) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
    }

    public BookDTOReduced(String name, String description, Double price, Long stock, AuthorDTOReduced author) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
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

    public AuthorDTOReduced getAuthor() {
        return author;
    }

    public void setAuthor(AuthorDTOReduced author) {
        this.author = author;
    }

    public Set<GenreDTO> getGenres() {
        return genres;
    }

    public void setGenres(Set<GenreDTO> genres) {
        this.genres = genres;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public String toString() {
        return "BookDTOReduced{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", stock=" + stock +
                ", author=" + author +
                ", genres=" + genres +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}
