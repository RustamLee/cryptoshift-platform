package com.example.demo.author.controler;

import com.example.demo.author.dto.AuthorDTO;
import com.example.demo.author.dto.AuthorDTOReduced;
import com.example.demo.author.dto.CreateAuthorDTO;
import com.example.demo.author.dto.UpdateAuthorDTO;
import com.example.demo.author.service.AuthorService;
import com.example.demo.exceptions.AlreadyExistingException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/authors")
public class AuthorControler {

    private final AuthorService authorService;

    public AuthorControler(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    public ResponseEntity<List<AuthorDTOReduced>> getAllAuthors () {
        List<AuthorDTOReduced> authors = authorService.getAll();
        return ResponseEntity.ok(authors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuthorDTO> getAuthorById (@PathVariable Long id) {
        Optional<AuthorDTO> author = authorService.getById(id);
        return author.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AuthorDTO> createAuthor(@Valid @RequestBody CreateAuthorDTO createAuthorDTO) {
        try {
            AuthorDTO authorDTO = authorService.createAuthor(createAuthorDTO);
            return new ResponseEntity<>(authorDTO, HttpStatus.CREATED);
        } catch (AlreadyExistingException e) {
            return new ResponseEntity<>(HttpStatus.NOT_ACCEPTABLE);
        }

    }

    @PutMapping("/{id}")
    public ResponseEntity<AuthorDTO> updateAuthor(@PathVariable Long id,@Valid @RequestBody UpdateAuthorDTO updateAuthorDTO){
        Optional<AuthorDTO> updatedAuthor = authorService.updateAuthor(id, updateAuthorDTO);
        return updatedAuthor.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteAuthor(@PathVariable Long id){
        try{
            boolean deleted = authorService.deleteAuthor(id);
            if (deleted){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }else{
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException ex){
            // author is referenced by books
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
        }
    }

}
