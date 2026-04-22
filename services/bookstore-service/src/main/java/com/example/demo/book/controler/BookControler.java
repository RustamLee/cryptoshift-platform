package com.example.demo.book.controler;

import com.example.demo.book.dto.BookDTO;
import com.example.demo.book.dto.BookDTOReduced;
import com.example.demo.book.dto.CreateBookDTO;
import com.example.demo.book.dto.UpdateBookDTO;
import com.example.demo.book.service.BookServiceImpl;
import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.UnautorizedException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/books")
public class BookControler {

    private final BookServiceImpl bookService;

    public BookControler(BookServiceImpl bookService) {
        this.bookService = bookService;
    }


    @GetMapping("/cart")
    public ResponseEntity<List<BookDTO>> getCart() {
        try {
            List<BookDTO> list = bookService.getCart();
            return ResponseEntity.ok(list);
        }catch (NotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<BookDTOReduced>> getAllBooks () {
        List<BookDTOReduced> books = bookService.getAll();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/author/{id}")
    public ResponseEntity<List<BookDTOReduced>> getBooksByAuthor(@PathVariable Long id){
        List<BookDTOReduced> books;
        try {
            books = bookService.getByAuthor(id);
            return ResponseEntity.ok(books);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<List<BookDTO>> getFiltered(
        @RequestParam(required = false) List<Long> genereId,
        @RequestParam(required = false) Long authorId){
        List<BookDTO> books= bookService.getBooksByFilterByIdList(
                Optional.ofNullable(genereId == null ? null : new ArrayList<>(genereId)),
                Optional.ofNullable(authorId)
        );
        return ResponseEntity.ok(books);
    }


    @GetMapping("/{id}")
    public ResponseEntity<BookDTO> getBookById(@PathVariable Long id) {
        Optional<BookDTO> book = bookService.getById(id);
        return book.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/genre/{id}")
    public ResponseEntity<List<BookDTOReduced>> getBooksByGenre(@PathVariable Long id) {
        List<BookDTOReduced> books;
        try{
            books = bookService.getByGenre(id);
            return ResponseEntity.ok(books);
        }catch (NotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }


    @PostMapping
    public ResponseEntity<BookDTO> createBook(@Valid @RequestBody CreateBookDTO createBookDTO){
        try {
            BookDTO bookDTO = bookService.createBook(createBookDTO);
            return new ResponseEntity<>(bookDTO, HttpStatus.CREATED);
        }catch (AlreadyExistingException | NotFoundException e){
            return new ResponseEntity<>(HttpStatus.NOT_ACCEPTABLE);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<BookDTO> updateBook(@PathVariable Long id,@Valid @RequestBody UpdateBookDTO updateBookDTO){
        try {
            Optional<BookDTO> updatedBook = bookService.updateBook(id, updateBookDTO);
            return updatedBook.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }catch (UnautorizedException e){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id){
        try {
            boolean deleted = bookService.deleteBook(id);
            if (deleted) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return ResponseEntity.notFound().build();
            }
        }catch (UnautorizedException e){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
    }

    @PutMapping("/add/{id}")
    public ResponseEntity<List<BookDTOReduced>> addBookToCart(@PathVariable Long id,@RequestBody Integer cant){
        try{
            List<BookDTOReduced> list=bookService.addToCart(id,cant);
            return ResponseEntity.ok(list);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }catch (ArithmeticException e){
            return ResponseEntity.badRequest().build();
        }

    }

    @PutMapping("/remove/{id}")
    public ResponseEntity<List<BookDTOReduced>> removeBookfromCart(@PathVariable Long id,@RequestBody Integer cant){
        try{
            List<BookDTOReduced> list=bookService.removeFromCart(id,cant);
            return ResponseEntity.ok(list);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        }catch (ArithmeticException e){
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/statistics/averageprice")
    public ResponseEntity<Double> getAveragePrice(){
        return ResponseEntity.ok(bookService.calculateAveragePrice());
    }

    @GetMapping("/statistics/books-per-author")
    public ResponseEntity<Map<String, Long>> getBooksPerAuthor(){
        return ResponseEntity.ok(bookService.countBooksPerAuthor());
    }


}
