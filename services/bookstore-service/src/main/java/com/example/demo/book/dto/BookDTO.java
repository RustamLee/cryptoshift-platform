package com.example.demo.book.dto;

import com.example.demo.author.dto.AuthorDTOReduced;
import com.example.demo.genre.dto.GenreDTO;
import com.example.demo.sellerprofile.dto.SellerProfileDTO;
import java.util.Objects;
import java.util.Set;

public class BookDTO {

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Long stock;
    private AuthorDTOReduced author;
    private Set<GenreDTO> genres;
    private SellerProfileDTO seller;
    private String imageUrl;

    public BookDTO(Long id, String name, String description, Double price, Long stock, AuthorDTOReduced author,
                   Set<GenreDTO> genres, SellerProfileDTO seller) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
        this.genres = genres;
        this.seller = seller;
    }

    public BookDTO(Long id, String name, String description, Double price, Long stock, AuthorDTOReduced author,
                   Set<GenreDTO> genres, String imageUrl, SellerProfileDTO seller) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
        this.genres = genres;
        this.imageUrl = imageUrl;
        this.seller = seller;
    }

    public BookDTO(String name, String description, Double price, Long stock, AuthorDTOReduced author,
                   Set<GenreDTO> genres, SellerProfileDTO seller) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.author = author;
        this.genres = genres;
        this.seller = seller;
    }

    public BookDTO() {
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

    public SellerProfileDTO getSeller() {
        return seller;
    }

    public void setSeller(SellerProfileDTO seller) {
        this.seller = seller;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BookDTO bookDTO = (BookDTO) o;
        return Objects.equals(name, bookDTO.name) && Objects.equals(author, bookDTO.author) && Objects.equals(genres, bookDTO.genres);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, author, genres);
    }

    @Override
    public String toString() {
        return "BookDTO{" +
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
