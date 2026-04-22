package com.example.demo.book.service;

import com.example.demo.author.dto.AuthorDTO;
import com.example.demo.author.dto.AuthorDTOReduced;
import com.example.demo.author.model.Author;
import com.example.demo.author.service.AuthorServiceImpl;
import com.example.demo.book.dto.BookDTO;
import com.example.demo.book.dto.BookDTOReduced;
import com.example.demo.book.dto.CreateBookDTO;
import com.example.demo.book.dto.UpdateBookDTO;
import com.example.demo.book.model.Book;
import com.example.demo.book.repository.BookRepository;
import com.example.demo.configuration.BookSpecification;
import com.example.demo.configuration.CurrentUserUtils;
import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.exceptions.InsufficientStockException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.UnautorizedException;
import com.example.demo.genre.dto.GenreDTO;
import com.example.demo.genre.model.Genre;
import com.example.demo.genre.service.GenreServiceImpl;
import com.example.demo.sellerprofile.service.SellerProfileServiceImpl;
import com.example.demo.user.model.User;
import com.example.demo.user.service.UserServiceImpl;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookServiceImpl implements BookService{

    private final BookRepository repository;
    private final AuthorServiceImpl authorService;
    private final UserServiceImpl userService;
    private final GenreServiceImpl genreService;
    private final SellerProfileServiceImpl profileService;

    public BookServiceImpl(BookRepository repository, AuthorServiceImpl authorService, UserServiceImpl userService, GenreServiceImpl genreService, SellerProfileServiceImpl profileService) {
        this.repository = repository;
        this.authorService = authorService;
        this.userService = userService;
        this.genreService = genreService;
        this.profileService = profileService;
    }

    @Override
    public BookDTO createBook(CreateBookDTO createBookDTO) throws AlreadyExistingException, NotFoundException {
        Book newBook = convertToEntity(createBookDTO);
        User user = userService.getCurrentUser();
        newBook.setSeller(user.getSellerProfile());
        if(repository.findAll().contains(newBook)){
            throw new AlreadyExistingException("Este libro ye existe");
        }
        if(user.getSellerProfile() == null){
            throw new NotFoundException("No estas registrado como vendedor");
        }
        Book savedBook = repository.save(newBook);
        return convertToDTO(savedBook);
    }

    @Override
    public List<BookDTOReduced> getAll() {
        return repository.findAll().stream().map(this::reduceBook).collect(Collectors.toList());
    }

    public List<BookDTO> getCart() throws NotFoundException {
        return userService.getCurrentUser().getCart().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<BookDTO> getById(Long id) {
        Optional<Book> book = repository.findById(id);
        return book.map(this::convertToDTO);
    }

    @Override
    public boolean deleteBook(Long id) throws UnautorizedException {
        Optional<Book> book = repository.findById(id);
        if (book.isPresent() && !book.get().getSeller().getSellerUser().getName().equals(CurrentUserUtils.getUsername())){
            throw new UnautorizedException("No esta autorizado para realizar esta acción");
        }
        if (book.isPresent()){
            repository.deleteById(id);
            return true;
        }else {
            return false;
        }
    }

    public List<BookDTOReduced> addToCart (Long id, Integer cant) throws NotFoundException {
        Optional<Book> book = repository.findById(id);
        if(book.isEmpty()){
            throw new NotFoundException("Libro no encontrado");
        }else if (cant < 0){
            throw new ArithmeticException("La cantidad no puede ser menor a 0");
        }
        return userService.addToUserCart(book.get(),cant).stream().map(this::reduceBook).collect(Collectors.toList());
    }

    public List<BookDTOReduced> removeFromCart (Long id, Integer cant) throws NotFoundException {
        Optional<Book> book = repository.findById(id);
        if(book.isEmpty()){
            throw new NotFoundException("Libro no encontrado");
        }else if (cant <=0){
            throw new ArithmeticException("La cantidad no puede ser 0 o menor");
        }
        return userService.removeFromUserCart(book.get(),cant).stream().map(this::reduceBook).collect(Collectors.toList());
    }

    @Override
    public double calculateAveragePrice() {
        return repository.findAll().stream()
                .mapToDouble(Book::getPrice)
                .average().orElse(0.0);
    }

    @Override
    public Map<String, Long> countBooksPerAuthor() {
        return repository.findAll().stream()
                .collect(Collectors.groupingBy(book -> book.getAuthor().getName(),
                        Collectors.counting()));
    }

    @Override
    public Optional<BookDTO> updateBook(Long id, UpdateBookDTO updateBookDTO) throws UnautorizedException {
        Optional<Book> book = repository.findById(id);
        if (book.isPresent() && !book.get().getSeller().getSellerUser().getName().equals(CurrentUserUtils.getUsername())){
            throw new UnautorizedException("No esta autorizado para realizar esta acicon");
        }
        return repository.findById(id)
                .map(existing ->{
                    if (updateBookDTO.getName() != null){
                        existing.setName(updateBookDTO.getName());
                    }
                    if (updateBookDTO.getDescription() != null){
                        existing.setDescription(updateBookDTO.getDescription());
                    }
                    if (updateBookDTO.getPrice() != null){
                        existing.setPrice(updateBookDTO.getPrice());
                    }
                    if (updateBookDTO.getStock() != null){
                        existing.setStock(updateBookDTO.getStock());
                    }
                    if (updateBookDTO.getAuthor() != null){
                        existing.setAuthor(updateBookDTO.getAuthor());
                    }
                    if (updateBookDTO.getGenres() != null){
                        existing.setGenres(updateBookDTO.getGenres());
                    }
                    if (updateBookDTO.getSeller() != null){
                        existing.setSeller(updateBookDTO.getSeller());
                    }
                    if (updateBookDTO.getImageUrl() != null) {
                        existing.setImageUrl(updateBookDTO.getImageUrl());
                    }
                    Book saved = repository.save(existing);
                    return convertToDTO(saved);
                });
    }

    public void updateStock(List<Book> cart) throws InsufficientStockException, NotFoundException {
        Map<Book, Long> bookCounts = cart.stream()
                .collect(Collectors.groupingBy(book -> book, Collectors.counting()));

        for (Map.Entry<Book, Long> entry : bookCounts.entrySet()) {
            Book book = entry.getKey();
            long quantity = entry.getValue();

            if (!repository.existsById(book.getId())) {
                throw new NotFoundException("El libro no está disponible");
            }

            if (book.getStock() < quantity) {
                throw new InsufficientStockException("Stock insuficiente para el libro: " + book.getName());
            }
            book.setStock(book.getStock() - (int) quantity);

            if (book.getSales() == null) {
                book.setSales(new ArrayList<>());
            }

            repository.save(book);
        }
    }


    @Override
    public List<BookDTOReduced> getByAuthor(Long id) throws NotFoundException {
        Optional<AuthorDTO> autor = authorService.getById(id);
        if (autor.isPresent()) {
            return repository.findAll().stream().filter(book -> book.getAuthor().getId().equals(autor.get().getId())).map(this::reduceBook).collect(Collectors.toList());
        }else {
            throw new NotFoundException("autor inexistente");
        }
    }

    public List<BookDTOReduced> getByGenre(Long id) throws NotFoundException {
        Optional<Genre> genre = genreService.getEntityById(id);
        if (genre.isPresent()) {
            return repository.findAll().stream().filter(book -> book.getGenres().contains(genre.get())).map(this::reduceBook).collect(Collectors.toList());
        }else {
            throw new NotFoundException("genero inexistente");
        }
    }

    @Override
    public Book convertToEntity(CreateBookDTO createBookDTO) {
        Book b = new Book(createBookDTO.getName(), createBookDTO.getDescription(),createBookDTO.getPrice(), createBookDTO.getStock(),createBookDTO.getAuthor(),createBookDTO.getGenres(),createBookDTO.getSeller());
        b.setImageUrl(createBookDTO.getImageUrl());
        return b;
    }

    @Override
    public BookDTO convertToDTO(Book book) {
        Set<GenreDTO> genres = book.getGenres().stream().map(g -> genreService.convertToDTO(g)).collect(Collectors.toSet());
        return new BookDTO(book.getId(), book.getName(), book.getDescription(), book.getPrice(), book.getStock(),reduceAuthor(book.getAuthor()),genres, book.getImageUrl(), profileService.convertToDTO(book.getSeller()));
    }

    public AuthorDTOReduced reduceAuthor(Author author){
        return new AuthorDTOReduced(author.getId(), author.getName(),author.getBirthDate());
    }
    public BookDTOReduced reduceBook(Book book){
        Set<com.example.demo.genre.dto.GenreDTO> genres = null;
        if (book.getGenres() != null) {
            genres = book.getGenres().stream().map(g -> genreService.convertToDTO(g)).collect(Collectors.toSet());
        }
        return new BookDTOReduced(book.getId(), book.getName(), book.getDescription(), book.getPrice(), book.getStock(), reduceAuthor(book.getAuthor()), genres, book.getImageUrl());
    }

    
    public List<BookDTO> getBooksByFilter(Optional<UUID> genreId, Optional<UUID> authorId) {
        Specification<Book> spec = Specification.where(BookSpecification.hasGenre(genreId))
                .and(BookSpecification.hasAuthor(authorId));

        System.out.println("Specification: " + spec);

        return repository.findAll(spec).stream().map(this::convertToDTO).toList();
    }


    public List<BookDTO> getBooksByFilterByIds(Optional<Long> genreId, Optional<Long> authorId) {
        List<Long> list = genreId.map(Collections::singletonList).orElse(null);
        return getBooksByFilterByIdList(Optional.ofNullable(list), authorId);
    }

    public List<BookDTO> getBooksByFilterByIdList(Optional<List<Long>> genreIdsOpt, Optional<Long> authorId) {
        List<Book> all = repository.findAll();
        List<Book> filtered = all.stream().filter(book -> {
            boolean ok = true;
            if (genreIdsOpt.isPresent() && genreIdsOpt.get() != null && !genreIdsOpt.get().isEmpty()) {
                List<Long> gIds = genreIdsOpt.get();
                ok = ok && book.getGenres() != null && book.getGenres().stream().anyMatch(g -> gIds.contains(g.getId()));
            }
            if (authorId.isPresent()) {
                Long aid = authorId.get();
                ok = ok && book.getAuthor() != null && book.getAuthor().getId().equals(aid);
            }
            return ok;
        }).collect(Collectors.toList());

        return filtered.stream().map(this::convertToDTO).collect(Collectors.toList());
    }


}
