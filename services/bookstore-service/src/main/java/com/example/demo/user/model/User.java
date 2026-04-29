package com.example.demo.user.model;

import com.example.demo.book.model.Book;
import com.example.demo.cards.model.Card;
import com.example.demo.order.model.Order;
import com.example.demo.sellerprofile.model.SellerProfile;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String password;

    @Column
    @Builder.Default
    private String status = "ACTIVE";

    @Column
    @Builder.Default
    private Boolean isTemporaryPassword = false;

    @ManyToMany
    @JoinTable(
            name = "users_cart",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "cart_id")
    )
    @Builder.Default
    private List<Book> cart= new ArrayList<>();

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Order> orders=new ArrayList<>();

    @OneToOne(mappedBy = "sellerUser")
    private SellerProfile sellerProfile;

    @OneToMany(mappedBy = "owner")
    @Builder.Default
    @ToString.Exclude
    private List<Card> cards= new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Builder.Default
    private Set<String> roles = new HashSet<>();


}
