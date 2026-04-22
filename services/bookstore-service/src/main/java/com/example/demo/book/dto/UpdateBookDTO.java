package com.example.demo.book.dto;

import com.example.demo.author.model.Author;
import com.example.demo.genre.model.Genre;
import com.example.demo.sellerprofile.model.SellerProfile;
import jakarta.validation.constraints.*;
import java.util.Objects;
import java.util.Set;

public class UpdateBookDTO {
    @Size(min = 1, max = 255, message = "El nombre del libro debe tener entre 1 y 255 caracteres")
    private String name;

    private String description;

    private String imageUrl;

    @Min(value = 0, message = "El precio no puede ser un valor negativo")
    private Double price;

    @Min(value = 0, message = "El stock no puede ser un valor negativo")
    private Long stock;

    @NotNull(message = "El autor no puede ser nulo")
    private Author author;
    private Set<Genre> genres;
    private SellerProfile seller;

    public UpdateBookDTO(String name, String description, Double price, Long stock, Author author, Set<Genre> genres, SellerProfile seller) {
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

    public UpdateBookDTO() {
    }

    public @Size(min = 1, max = 255, message = "El nombre del libro debe tener entre 1 y 255 caracteres") String getName() {
        return name;
    }

    public void setName(@Size(min = 1, max = 255, message = "El nombre del libro debe tener entre 1 y 255 caracteres") String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public @Min(value = 0, message = "El precio no puede ser un valor negativo") Double getPrice() {
        return price;
    }

    public void setPrice(@Min(value = 0, message = "El precio no puede ser un valor negativo") Double price) {
        this.price = price;
    }

    public @Min(value = 0, message = "El stock no puede ser un valor negativo") Long getStock() {
        return stock;
    }

    public void setStock(@Min(value = 0, message = "El stock no puede ser un valor negativo") Long stock) {
        this.stock = stock;
    }

    public @NotNull(message = "El autor no puede ser nulo") Author getAuthor() {
        return author;
    }

    public void setAuthor(@NotNull(message = "El autor no puede ser nulo") Author author) {
        this.author = author;
    }

    public Set<Genre> getGenres() {
        return genres;
    }

    public void setGenres(Set<Genre> genres) {
        this.genres = genres;
    }


    public SellerProfile getSeller() {
        return seller;
    }

    public void setSeller(SellerProfile seller) {
        this.seller = seller;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UpdateBookDTO that = (UpdateBookDTO) o;
        return  Objects.equals(name, that.name) && Objects.equals(description, that.description) && Objects.equals(price, that.price) &&
                Objects.equals(stock, that.stock) && Objects.equals(author, that.author) && Objects.equals(genres, that.genres) &&
                Objects.equals(seller, that.seller);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, description, price, stock, author, genres, seller);
    }

    @Override
    public String toString() {
        return "UpdateBookDTO{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", price=" + price +
                ", stock=" + stock +
                ", author=" + author +
                ", genres=" + genres +
                ", seller=" + seller +
                '}';
    }
}
