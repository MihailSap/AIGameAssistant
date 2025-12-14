package ru.project.gameAssistantBackend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.project.gameAssistantBackend.dto.user.UpdatePasswordDTO;
import ru.project.gameAssistantBackend.dto.user.UserRequestDTO;
import ru.project.gameAssistantBackend.exception.customEx.notFound.UserNotFoundException;
import ru.project.gameAssistantBackend.models.Model;
import ru.project.gameAssistantBackend.models.Role;
import ru.project.gameAssistantBackend.models.User;
import ru.project.gameAssistantBackend.repository.UserRepository;
import ru.project.gameAssistantBackend.service.UserServiceI;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserServiceI {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final FileServiceImpl fileServiceImpl;

    @Autowired
    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            FileServiceImpl fileServiceImpl
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileServiceImpl = fileServiceImpl;
    }

    @Override
    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    @Override
    public User getById(Long id) throws UserNotFoundException {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Пользователь с таким id не найден"));
    }

    @Override
    public User getByEmail(String email) throws UserNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
    }

    public User getUserByPasswordResetToken(String token) {
        return userRepository.findByPasswordResetToken(token)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    @Transactional
    public User create(UserRequestDTO userRequestDTO){
        User user = new User();
        user.setEmail(userRequestDTO.email());
        user.setLogin(userRequestDTO.login());
        user.setPassword(passwordEncoder.encode(userRequestDTO.password()));
        user.setRole(Role.USER);
        user.setEnabled(false);

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        return userRepository.save(user);
    }

    @Transactional
    @Override
    public void updatePassword(User user, String password) {
        String newEncodedPassword = passwordEncoder.encode(password);
        user.setPassword(newEncodedPassword);
        userRepository.save(user);
    }

    @Transactional
    public void updateModel(User user, Model model) {
        user.setModel(model);
        userRepository.save(user);
    }

    @Transactional
    @Override
    public User updateImage(User user, MultipartFile imageFile) {
        String oldUserImageTitle = user.getImageFileTitle();
        fileServiceImpl.delete(oldUserImageTitle);

        String newUserImageTitle = fileServiceImpl.save(imageFile);
        user.setImageFileTitle(newUserImageTitle);
        userRepository.save(user);

        return user;
    }

    @Transactional
    @Override
    public void updateRole(Long id) throws UserNotFoundException {
        User user = getById(id);
        if(user.getRole().equals(Role.ADMIN)){
            user.setRole(Role.USER);
        } else {
            user.setRole(Role.ADMIN);
        }
        userRepository.save(user);
    }

    public void setNullPasswordResetToken(User user){
        user.setPasswordResetToken(null);
        userRepository.save(user);
    }

    public String setPasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        userRepository.save(user);
        return token;
    }

    @Transactional
    @Override
    public void deleteUser(Long userId) throws UserNotFoundException {
        User user = getById(userId);
        userRepository.delete(user);
    }
}
