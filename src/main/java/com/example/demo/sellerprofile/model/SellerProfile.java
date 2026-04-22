package com.example.demo.sellerprofile.model;

import com.example.demo.book.model.Book;
import com.example.demo.user.model.User;
import jakarta.persistence.*;

import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "sellers")
public class SellerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String afipNumber;

    @OneToMany(mappedBy = "seller")
    private List<Book> inventory;

    @OneToOne
    @JoinColumn(name = "seller_user_id", unique = true)
    private User sellerUser;

    public SellerProfile(Long id, String name, String address, String afipNumber, List<Book> inventory, User sellerUser) {
        this.id = id;
        this.name = name;
        this.address = address;
        this.afipNumber = afipNumber;
        this.inventory = inventory;
        this.sellerUser = sellerUser;
    }

    public SellerProfile(String name, String address, String afipNumber, User sellerUser) {
        this.name = name;
        this.address = address;
        this.afipNumber = afipNumber;
        this.sellerUser = sellerUser;
    }

    public SellerProfile() {
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

    public List<Book> getInventory() {
        return inventory;
    }

    public void setInventory(List<Book> inventory) {
        this.inventory = inventory;
    }

    public User getSellerUser() {
        return sellerUser;
    }

    public void setSellerUser(User sellerUser) {
        this.sellerUser = sellerUser;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SellerProfile that = (SellerProfile) o;
        return Objects.equals(name, that.name) && Objects.equals(address, that.address) && Objects.equals(afipNumber, that.afipNumber) && Objects.equals(sellerUser, that.sellerUser);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, address, afipNumber, inventory, sellerUser);
    }

    @Override
    public String toString() {
        return "SellerProfile{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", afipNumber='" + afipNumber + '\'' +
                ", Inventory=" + inventory +
                ", sellerUser=" + sellerUser +
                '}';
    }
}
