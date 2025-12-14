package ru.project.gameAssistantBackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.transport.ProxyProvider;

@Configuration
public class WebConfig {
    @Value("${proxy.host}")
    private String host;

    @Value("${proxy.port}")
    private int port;

    @Value("${proxy.login}")
    private String login;

    @Value("${proxy.password}")
    private String password;

    @Bean("proxyWebClient")
    public WebClient proxyWebClient() {
        HttpClient httpClient = HttpClient.create()
                .proxy(proxy -> proxy
                        .type(ProxyProvider.Proxy.SOCKS5)
                        .host(host)
                        .port(port)
                        .username(login)
                        .password(p -> password)
                );

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }

    @Bean
    @Primary
    public WebClient defaultWebClient() {
        return WebClient.builder().build();
    }
}
