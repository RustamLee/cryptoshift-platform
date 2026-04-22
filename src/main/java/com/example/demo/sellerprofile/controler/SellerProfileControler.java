package com.example.demo.sellerprofile.controler;

import com.example.demo.exceptions.AlreadyExistingException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.sellerprofile.dto.CreateSellerProfileDTO;
import com.example.demo.sellerprofile.dto.SellerProfileDTO;
import com.example.demo.sellerprofile.dto.SellerProfileDTOFull;
import com.example.demo.sellerprofile.dto.UpdateSellerProfileDTO;
import com.example.demo.sellerprofile.service.SellerProfileServiceImpl;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sellerProfiles")
public class SellerProfileControler {

    private final SellerProfileServiceImpl sellerProfileService;

    public SellerProfileControler(SellerProfileServiceImpl sellerProfileService) {
        this.sellerProfileService = sellerProfileService;
    }

    @GetMapping
    public ResponseEntity<List<SellerProfileDTO>> getAllSellers () {
        List<SellerProfileDTO> sellers = sellerProfileService.getAll();
        return ResponseEntity.ok(sellers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SellerProfileDTOFull> getSellerById (@PathVariable Long id) {
        Optional<SellerProfileDTOFull> seller = sellerProfileService.getById(id);
        return seller.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SellerProfileDTO> createSellerProfile(@Valid @RequestBody CreateSellerProfileDTO createSellerProfileDTO){
        try {
            SellerProfileDTO sellerDTO = sellerProfileService.createSellerProfile(createSellerProfileDTO);
            return new ResponseEntity<>(sellerDTO, HttpStatus.CREATED);
        } catch (AlreadyExistingException | NotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_ACCEPTABLE);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<SellerProfileDTOFull> getMySellerProfile() {
        try {
            Optional<SellerProfileDTOFull> seller = sellerProfileService.getCurrentSellerProfile();
            return seller.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/update")
    public ResponseEntity<SellerProfileDTO> updateSellerProfile(@Valid @RequestBody UpdateSellerProfileDTO updateSellerProfileDTO){
        try {
            SellerProfileDTO updatedBook = sellerProfileService.updateSellerProfile( updateSellerProfileDTO);
            return ResponseEntity.ok(updatedBook);
        }catch (NotFoundException e){
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteBook(){
        try {
            boolean deleted = sellerProfileService.deleteSellerProfile();
            if (deleted){
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }else{
                return ResponseEntity.notFound().build();
            }
        }catch (NotFoundException e){
            return ResponseEntity.notFound().build();
        }

    }
}
