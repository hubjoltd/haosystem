package com.erp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        registry.addResourceHandler("/*.js", "/*.css", "/*.ico", "/*.png", "/*.svg", "/*.woff", "/*.woff2", "/*.ttf")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        return null;
                    }
                });
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward non-API, non-static paths to index.html for Angular SPA routing
        // Exclude "api" and "ws" prefixes so Spring controllers handle those requests
        registry.addViewController("/{path:(?!api|ws)[^\\.]*}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{path:(?!api|ws)[^\\.]*}/{subpath:[^\\.]*}")
                .setViewName("forward:/index.html");
        registry.addViewController("/{path:(?!api|ws)[^\\.]*}/{subpath:[^\\.]*}/{remaining:[^\\.]*}")
                .setViewName("forward:/index.html");
    }
}
