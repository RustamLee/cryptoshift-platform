package com.example.demo.author.service;

import com.example.demo.author.dto.AuthorDTO;
import com.example.demo.author.dto.AuthorDTOReduced;
import com.example.demo.author.dto.CreateAuthorDTO;
import com.example.demo.author.dto.UpdateAuthorDTO;
import com.example.demo.author.model.Author;
import com.example.demo.author.repository.AuthorRepository;
import com.example.demo.book.repository.BookRepository;
import com.example.demo.book.dto.BookDTOReduced;
import com.example.demo.book.model.Book;
import com.example.demo.exceptions.AlreadyExistingException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository repository;
    private final BookRepository bookRepository;

    public AuthorServiceImpl(AuthorRepository repository, BookRepository bookRepository) {
        this.repository = repository;
        this.bookRepository = bookRepository;
    }

    @Override
    public AuthorDTO createAuthor(CreateAuthorDTO createAuthorDTO) throws AlreadyExistingException {
        Author newAuthor = convertToEntity(createAuthorDTO);
        if (repository.findAll().contains(newAuthor)){
            throw new AlreadyExistingException("el autor ya existe");
        }
        Author savedAuthor= repository.save(newAuthor);
        return convertToDTO(savedAuthor);
    }

    @Override
    public List<AuthorDTOReduced> getAll() {
        return repository.findAll().stream().map(this::reduceAuthor).collect(Collectors.toList());
    }

    @Override
    public boolean deleteAuthor(Long id) {
        Optional<Author> author = repository.findById(id);
        if (author.isPresent()){
            if (bookRepository.existsByAuthor_Id(id)){
                throw new IllegalStateException("Author has books and cannot be deleted");
            }
            repository.deleteById(id);
            return true;
        }else {
            return false;
        }
    }

    @Override
    public Optional<AuthorDTO> getById(Long id) {
        Optional<Author> author = repository.findById(id);
        return author.map(this::convertToDTO);
    }

    @Override
    public Optional<AuthorDTO> updateAuthor(Long id, UpdateAuthorDTO updateAuthorDTO) {
        return repository.findById(id)
                .map(existing ->{
                    if (updateAuthorDTO.getName() != null){
                        existing.setName(updateAuthorDTO.getName());
                    }
                    if (updateAuthorDTO.getBirthDate() != null){
                        existing.setBirthDate(updateAuthorDTO.getBirthDate());
                    }
                    Author saved = repository.save(existing);
                    return convertToDTO(saved);
                });
    }

    @Override
    public Author convertToEntity(CreateAuthorDTO createAuthorDTO) {
        return new Author(createAuthorDTO.getName(),createAuthorDTO.getBirthDate());
    }

    @Override
    public AuthorDTO convertToDTO(Author author) {
        if(author.getBookslist() == null){
            return new AuthorDTO(author.getId(),author.getName(),author.getBirthDate(),new ArrayList<>());
        }
        return new AuthorDTO(author.getId(),author.getName(),author.getBirthDate(),author.getBookslist().stream().map(this::reduceBook).toList());
    }

    private AuthorDTOReduced reduceAuthor(Author author){
        return new AuthorDTOReduced(author.getId(), author.getName(),author.getBirthDate());
    }
    private BookDTOReduced reduceBook(Book book){
        return new BookDTOReduced(book.getId(), book.getName(), book.getDescription());
    }
}
