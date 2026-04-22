package com.example.demo.sellerprofile.dto;

import com.example.demo.book.dto.BookDTOReduced;

import java.util.List;
import java.util.Objects;

public class SellerProfileDTOFull {
    private Long id;
    private String name;
    private String address;
    private String afipNumber;
    private List<BookDTOReduced> books;

    public SellerProfileDTOFull(Long id, String name, String address, String afipNumber, List<BookDTOReduced> books) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.afipNumber = afipNumber;
        this.books = books;
    }

    public SellerProfileDTOFull() {
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

    public String getAddress() {
        return address;
    }

    public java.util.List<com.example.demo.book.dto.BookDTOReduced> getBooks() {
        return books;
    }

    public void setBooks(java.util.List<com.example.demo.book.dto.BookDTOReduced> books) {
        this.books = books;
    }

    public void setAddress(String address) {
        this.address = address;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SellerProfileDTOFull that = (SellerProfileDTOFull) o;
        return Objects.equals(name, that.name) && Objects.equals(address, that.address) && Objects.equals(afipNumber, that.afipNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, address, afipNumber);
    }
}
