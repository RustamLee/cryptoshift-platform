package com.example.demo.sale.service;

import com.example.demo.exceptions.InsufficientStockException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.exceptions.UnautorizedException;
import com.example.demo.sale.dto.CreateSaleDTO;
import com.example.demo.sale.dto.SaleDTO;
import com.example.demo.sale.dto.UpdateSaleDTO;
import com.example.demo.sale.model.Sale;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface SaleService {
    Optional<SaleDTO> getById(Long id);
    List<SaleDTO> getAll();
    SaleDTO createSale(Long id) throws NotFoundException, InsufficientStockException, UnautorizedException, IOException;
    Optional<SaleDTO> updateSale (Long id, UpdateSaleDTO updateSaleDTO);
    boolean deleteSale(Long id);
    void sendSaleEmail(String userEmail, String saleDetails) throws IOException;

    Sale convertToEntity(CreateSaleDTO createSaleDTO);
    SaleDTO convertToDTO(Sale sale);
}
