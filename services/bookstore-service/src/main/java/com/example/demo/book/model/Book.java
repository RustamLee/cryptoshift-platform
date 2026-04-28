package com.example.demo.book.model;

import com.example.demo.author.model.Author;
import com.example.demo.genre.model.Genre;
import com.example.demo.order.model.Order;
import com.example.demo.sellerprofile.model.SellerProfile;
import com.example.demo.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private Long stock;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Author author;

    @ManyToMany
    @JoinTable(
            name = "books_genres",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();

    @ManyToMany(mappedBy = "books")
    @Builder.Default
    private List<Order> orders= new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private SellerProfile seller;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    @Column
    @Builder.Default
    private Boolean available = true;

    @ManyToMany(mappedBy = "cart")
    @Builder.Default
    private List<User> cartUser= new ArrayList<>();
}
