package ru.project.gameAssistantBackend.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.dto.user.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.user.UserResponseDTO;
import ru.project.gameAssistantBackend.enums.Model;
import ru.project.gameAssistantBackend.enums.Role;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.repository.UserRepository;
import ru.project.gameAssistantBackend.service.UserServiceI;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class UserServiceImpl implements UserServiceI {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileServiceImpl fileServiceImpl;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, FileServiceImpl fileServiceImpl) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileServiceImpl = fileServiceImpl;
    }

    @Override
    public Optional<User> getByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public UserResponseDTO getResponseDTOByEmail(String email) {
        var user = getByEmail(email).orElseThrow(() -> new RuntimeException("Пользователь не найден"));
        return mapToResponseDTO(user);
    }

    @Override
    public User getById(Long id){
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь с таким id не найден"));
    }

    @Override
    public UserResponseDTO mapToResponseDTO(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getLogin(),
                user.getRole().equals(Role.ADMIN),
                user.getImageFileTitle(),
                user.getModel()
        );
    }

    @Transactional
    @Override
    public void updatePassword(Long userId, UpdatePasswordDTO updatePasswordDTO){
        var user = getById(userId);
        var newEncodedPassword = passwordEncoder.encode(updatePasswordDTO.newPassword());
        user.setPassword(newEncodedPassword);
        userRepository.save(user);
        log.info("Пароль успешно обновлен");
    }

    @Transactional
    public void updateModel(Long userId, Model model){
        User user = getById(userId);
        user.setModel(model);
        userRepository.save(user);
    }

    @Transactional
    @Override
    public User updateImage(Long userId, MultipartFile imageFile){
        User user = getById(userId);

        var oldUserImageTitle = user.getImageFileTitle();
        fileServiceImpl.delete(oldUserImageTitle);

        var newUserImageTitle = fileServiceImpl.save(imageFile);
        user.setImageFileTitle(newUserImageTitle);
        userRepository.save(user);

        return user;
    }

    @Override
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    @Override
    public List<UserResponseDTO> mapAllUsersDTO(List<User> users){
        List<UserResponseDTO> userResponseDTOS = new ArrayList<>();
        for(var user : users){
            userResponseDTOS.add(mapToResponseDTO(user));
        }
        return userResponseDTOS;
    }

    @Transactional
    @Override
    public void deleteUser(Long userId){
        var user = getById(userId);
        userRepository.delete(user);
    }

    @Transactional
    @Override
    public void changeRole(Long id){
        var user = getById(id);
        if(user.getRole().equals(Role.ADMIN)){
            user.setRole(Role.USER);
        } else {
            user.setRole(Role.ADMIN);
        }
        userRepository.save(user);
    }
}
