package com.example.tz;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    private final TaskRepository repository;

    public TaskController(TaskRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> addTask(@RequestBody Task task) {
        if (task.getDeadline().isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Дедлайн не может быть раньше текущей даты");
        }

        Task savedTask = repository.save(task);
        return ResponseEntity.ok(savedTask);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTask(@PathVariable Long id) {
        Task task = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        System.out.println("Статус до изменения: " + task.isCompleted());
        task.setCompleted(!task.isCompleted());
        Task updatedTask = repository.save(task);
        System.out.println("Статус после изменения: " + updatedTask.isCompleted());

        return ResponseEntity.ok(updatedTask);
    }
}