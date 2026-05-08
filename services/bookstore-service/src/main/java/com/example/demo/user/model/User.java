package com.example.demo.user.model;
import com.example.demo.cartitem.model.CartItem;
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

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();


    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<Order> orders=new ArrayList<>();

    @OneToOne(mappedBy = "sellerUser")
    private SellerProfile sellerProfile;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @Builder.Default
    private Set<String> roles = new HashSet<>();


}
