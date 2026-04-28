package com.example.demo.sellerprofile.model;

import com.example.demo.book.model.Book;
import com.example.demo.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "sellers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class SellerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String afipNumber;

    @OneToMany(mappedBy = "seller")
    @Builder.Default
    private List<Book> inventory= new ArrayList<>();

    @OneToOne
    @JoinColumn(name = "seller_user_id", unique = true)
    private User sellerUser;

}
