package com.example.demo.sellerprofile.dto;
import com.example.demo.book.model.Book;

import java.util.List;
import java.util.Objects;

public class SellerProfileDTO {

    private Long id;
    private String name;
    private String address;
    private String afipNumber;

    public SellerProfileDTO(Long id, String name, String address, String afipNumber) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.afipNumber = afipNumber;
    }

    public SellerProfileDTO(String name, String address, String afipNumber, List<Book> inventory) {
        this.name = name;
        this.address = address;
        this.afipNumber = afipNumber;

    }

    public SellerProfileDTO() {
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

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAfipNumber() {
        return afipNumber;
    }

    public void setAfipNumber(String afipNumber) {
        this.afipNumber = afipNumber;
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SellerProfileDTO that = (SellerProfileDTO) o;
        return Objects.equals(name, that.name) && Objects.equals(address, that.address) && Objects.equals(afipNumber, that.afipNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, address, afipNumber);
    }

    @Override
    public String toString() {
        return "SellerProfileDTO{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", afipNumber='" + afipNumber + '\'' +
                '}';
    }
}
