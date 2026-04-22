package com.example.demo.book.repository;

import com.example.demo.book.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>, JpaSpecificationExecutor<Book> {
	boolean existsByAuthor_Id(Long authorId);

	boolean existsByGenres_Id(Long genreId);

	boolean existsBySeller_Id(Long sellerId);

	java.util.List<Book> findBySeller_Id(Long sellerId);
}
