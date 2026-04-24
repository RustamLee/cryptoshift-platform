package com.example.demo.order.controler;

import com.example.demo.exceptions.InsufficientStockException;
import com.example.demo.exceptions.NotFoundException;
import com.example.demo.order.dto.OrderDTO;
import com.example.demo.order.dto.UpdateOrderDTO;
import com.example.demo.order.service.OrderServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sales")
public class OrderControler {

    private final OrderServiceImpl orderService;

    public OrderControler(OrderServiceImpl orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllSales () {
        List<OrderDTO> sales = orderService.getAll();
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getSaleById (@PathVariable Long id) {
        Optional<OrderDTO> sale = orderService.getById(id);
        return sale.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createSale(@RequestBody Long id){
        try {
            OrderDTO orderDTO = orderService.createOrder(id);
            return new ResponseEntity<>(orderDTO, HttpStatus.CREATED);
        } catch (NotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (InsufficientStockException | IOException e) {
            return ResponseEntity.badRequest().build();
        }

    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDTO> updateSale(@PathVariable Long id, @RequestBody UpdateOrderDTO updateOrderDTO){
        Optional<OrderDTO> updatedSale = orderService.updateOrder(id, updateOrderDTO);
        return updatedSale.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id){
        boolean deleted = orderService.deleteOrder(id);
        if (deleted){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }else{
            return ResponseEntity.notFound().build();
        }
    }
}
