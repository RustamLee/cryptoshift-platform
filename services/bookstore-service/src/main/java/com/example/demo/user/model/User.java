package com.example.demo.user.model;

import com.example.demo.book.model.Book;
import com.example.demo.cards.model.Card;
import com.example.demo.order.model.Order;
import com.example.demo.sellerprofile.model.SellerProfile;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String password;

    @Column
    private String status = "ACTIVE"; 

    @Column
    private Boolean isTemporaryPassword = false;

    @ManyToMany
    private List<Book> cart;

    @OneToMany(mappedBy = "user")
    private List<Order> orders;

    @OneToOne(mappedBy = "sellerUser")
    private SellerProfile sellerProfile;

    @OneToMany(mappedBy = "owner")
    private List<Card> cards;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    private Set<String> roles = new HashSet<>();

    public User(Long id, String name, String password, List<Book> cart, List<Order> orders, SellerProfile sellerProfile, List<Card> cards) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.cart = cart;
        this.orders = orders;
        this.sellerProfile = sellerProfile;
        this.cards = cards;
    }

    public User(String name, String password, List<Book> cart, List<Order> orders, SellerProfile sellerProfile, List<Card> cards) {
        this.name = name;
        this.password = password;
        this.cart = cart;
        this.orders = orders;
        this.sellerProfile = sellerProfile;
        this.cards = cards;
    }

    public User(String name, String password) {
        this.name = name;
        this.password = password;
    }

    public User() {
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Book> getCart() {
        return cart;
    }

    public void setCart(List<Book> cart) {
        this.cart = cart;
    }

    public List<Order> getOrders() {
        return orders;
    }

    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }

    public SellerProfile getSellerProfile() {
        return sellerProfile;
    }

    public void setSellerProfile(SellerProfile sellerProfile) {
        this.sellerProfile = sellerProfile;
    }

    public List<Card> getCards() {
        return cards;
    }

    public void setCards(List<Card> cards) {
        this.cards = cards;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsTemporaryPassword() {
        return isTemporaryPassword;
    }

    public void setIsTemporaryPassword(Boolean isTemporaryPassword) {
        this.isTemporaryPassword = isTemporaryPassword;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return Objects.equals(name, user.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", password='" + password + '\'' +
                ", cart=" + cart +
                ", orders=" + orders +
                ", sellerProfile=" + sellerProfile +
                ", cards=" + cards +
                '}';
    }
}
