package com.example.demo.genre.repository;

import com.example.demo.genre.model.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface GenreRepository extends JpaRepository<Genre,Long> {
}
