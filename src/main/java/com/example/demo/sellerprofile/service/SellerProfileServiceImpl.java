package com.example.demo.sellerprofile.service;
import com.example.demo.book.dto.BookDTOReduced;
import com.example.demo.book.model.Book;
import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.sellerprofile.dto.CreateSellerProfileDTO;
import com.example.demo.sellerprofile.dto.SellerProfileDTO;
import com.example.demo.sellerprofile.dto.SellerProfileDTOFull;
import com.example.demo.sellerprofile.dto.UpdateSellerProfileDTO;
import com.example.demo.sellerprofile.model.SellerProfile;
import com.example.demo.sellerprofile.repository.SellerProfileRepository;
import com.example.demo.user.model.User;
import com.example.demo.user.service.UserServiceImpl;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SellerProfileServiceImpl implements SellerProfileService{

    private final SellerProfileRepository repository;
    private final UserServiceImpl userService;

    public SellerProfileServiceImpl(SellerProfileRepository repository, UserServiceImpl userService) {
        this.repository = repository;
        this.userService = userService;
    }

    @Override
    public List<SellerProfileDTO> getAll() {
        return repository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public Optional<SellerProfileDTOFull> getById(Long id) {
        Optional<SellerProfile> seller = repository.findById(id);
        return seller.map(this::convertToFullDTO);
    }

    @Override
    public boolean deleteSellerProfile() throws NotFoundException {
        User user = userService.getCurrentUser();
        SellerProfile seller = user.getSellerProfile();
        if (seller != null) {
            repository.delete(seller);
            return true;
        } else {
            return false;
        }
    }

    @Override
    public SellerProfileDTO updateSellerProfile(UpdateSellerProfileDTO updateSellerProfileDTO) throws NotFoundException {
        User user = userService.getCurrentUser();
        SellerProfile existing = user.getSellerProfile();
        if (existing == null) {
            throw new NotFoundException("No hay un perfil de vendedor registrado para tu usuario");
        }
        if (updateSellerProfileDTO.getName() != null) {
            existing.setName(updateSellerProfileDTO.getName());
        }
        if (updateSellerProfileDTO.getAddress() != null) {
            existing.setAddress(updateSellerProfileDTO.getAddress());
        }
        if (updateSellerProfileDTO.getAfipNumber() != null) {
            existing.setAfipNumber(updateSellerProfileDTO.getAfipNumber());
        }
        if (updateSellerProfileDTO.getSellerUser() != null) {
            existing.setSellerUser(updateSellerProfileDTO.getSellerUser());
        }
        SellerProfile saved = repository.save(existing);
        return convertToDTO(saved);
    }

    @Override
    public SellerProfileDTO createSellerProfile(CreateSellerProfileDTO createSellerProfileDTO) throws AlreadyExistingException, NotFoundException {
        SellerProfile newSeller = convertToEntity(createSellerProfileDTO);
        User user =userService.getCurrentUser();
        if(user.getSellerProfile() != null){
            throw new AlreadyExistingException("El usuario ya esta registrado como vendedor");
        }
        newSeller.setSellerUser(user);
        if (repository.findAll().contains(newSeller)){
            throw new AlreadyExistingException("El vendedor ya esta registrado");
        }
        SellerProfile savedSeller = repository.save(newSeller);
        user.getRoles().add("ROLE_SELLER");
        userService.saveCurrentUser(user);
        return convertToDTO(savedSeller);
    }

    @Override
    public Optional<SellerProfileDTOFull> getCurrentSellerProfile() {
      try {
        User user = userService.getCurrentUser();
        if (user.getSellerProfile() == null) return Optional.empty();
        return Optional.of(convertToFullDTO(user.getSellerProfile()));
      } catch (Exception e) {
        return Optional.empty();
      }
    }

    @Override
    public SellerProfileDTO convertToDTO(SellerProfile sellerProfile) {
        return new SellerProfileDTO(sellerProfile.getId(), sellerProfile.getName(), sellerProfile.getAddress(), sellerProfile.getAfipNumber());
    }

    @Override
    public SellerProfile convertToEntity(CreateSellerProfileDTO createSellerProfileDTO) {
        return new SellerProfile(createSellerProfileDTO.getName(), createSellerProfileDTO.getAddress(), createSellerProfileDTO.getAfipNumber(), createSellerProfileDTO.getSellerUser());
    }

    public SellerProfileDTOFull convertToFullDTO(SellerProfile sellerProfile){
        java.util.List<BookDTOReduced> books = sellerProfile.getInventory() == null ? java.util.Collections.emptyList() : sellerProfile.getInventory().stream().map(this::reduceBook).collect(Collectors.toList());
        return new SellerProfileDTOFull(sellerProfile.getId(), sellerProfile.getName(), sellerProfile.getAddress(), sellerProfile.getAfipNumber(), books);
    }
    public BookDTOReduced reduceBook(Book book){
        com.example.demo.author.dto.AuthorDTOReduced a = null;
        if (book.getAuthor() != null) {
            a = new com.example.demo.author.dto.AuthorDTOReduced(book.getAuthor().getId(), book.getAuthor().getName(), book.getAuthor().getBirthDate());
        }
        return new com.example.demo.book.dto.BookDTOReduced(book.getId(), book.getName(), book.getDescription(), book.getPrice(), book.getStock(), a);
    }
}
