package com.example.demo.author.service;

import com.example.demo.author.dto.AuthorDTO;
import com.example.demo.author.dto.AuthorDTOReduced;
import com.example.demo.author.dto.CreateAuthorDTO;
import com.example.demo.author.dto.UpdateAuthorDTO;
import com.example.demo.author.model.Author;
import com.example.demo.exceptions.AlreadyExistingException;

import java.util.List;
import java.util.Optional;

public interface AuthorService {
    Optional<AuthorDTO> getById(Long id);
    List<AuthorDTOReduced> getAll();
    AuthorDTO createAuthor(CreateAuthorDTO createAuthorDTO) throws AlreadyExistingException;
    Optional<AuthorDTO> updateAuthor (Long id, UpdateAuthorDTO updateAuthorDTO);
    boolean deleteAuthor(Long id);

    Author convertToEntity(CreateAuthorDTO createAuthorDTO);
    AuthorDTO convertToDTO(Author author);
}
