package com.example.demo.configuration;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;

import com.example.demo.book.model.Book;

public class BookSpecification {

    public static Specification<Book> hasGenre(Optional<UUID> genreId) {
        return (root, query, criteriaBuilder) -> genreId.map(id ->
                criteriaBuilder.equal(root.get("genre").get("id"), id)
        ).orElse(null);
    }

    public static Specification<Book> hasAuthor(Optional<UUID> authorId) {
        return (root, query, criteriaBuilder) -> authorId.map(id ->
                criteriaBuilder.equal(root.get("author").get("id"), id)
        ).orElse(null);
    }
}