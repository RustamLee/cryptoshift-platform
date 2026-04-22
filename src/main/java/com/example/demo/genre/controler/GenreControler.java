package com.example.demo.genre.controler;

import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.genre.dto.CreateGenreDTO;
import com.example.demo.genre.dto.GenreDTO;
import com.example.demo.genre.dto.UpdateGenreDTO;
import com.example.demo.genre.service.GenreServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/genres")
public class GenreControler {

    private final GenreServiceImpl genreService;

    public GenreControler(GenreServiceImpl genreService) {
        this.genreService = genreService;
    }

    @GetMapping
    public ResponseEntity<List<GenreDTO>> getAllGenre () {
        List<GenreDTO> genres = genreService.getAll();
        return ResponseEntity.ok(genres);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GenreDTO> getGenreById (@PathVariable Long id) {
        Optional<GenreDTO> genre = genreService.getById(id);
        return genre.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GenreDTO> createGenre(@Valid @RequestBody CreateGenreDTO createGenreDTO){
        try {
            GenreDTO genreDTO = genreService.createGenre(createGenreDTO);
            return new ResponseEntity<>(genreDTO, HttpStatus.CREATED);
        } catch (AlreadyExistingException e) {
            return new ResponseEntity<>(HttpStatus.NOT_ACCEPTABLE);
        }

    }

    @PutMapping("/{id}")
    public ResponseEntity<GenreDTO> updateGenre(@PathVariable Long id,@Valid @RequestBody UpdateGenreDTO updateGenreDTO){
        Optional<GenreDTO> updatedGenre = genreService.updateGenre(id, updateGenreDTO);
        return updatedGenre.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteGenre(@PathVariable Long id){
        try{
            boolean deleted = genreService.deleteGenre(id);
            if (deleted){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }else{
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException ex){
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }
}
