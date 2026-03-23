pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-creds'
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig-creds'
        DOCKERHUB_REPO = '23p61a05m5/portfolio'
        DOCKERHUB_REPO_BACKEND = '23p61a05m5/portfolio-backend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                    bat 'npm run build'
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    bat "docker build -t %DOCKERHUB_REPO_BACKEND%:%BUILD_NUMBER% ."
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                script {
                    env.APP_VERSION = "v1.0.${env.BUILD_NUMBER}"
                }
                bat """
                docker build ^
                --build-arg APP_VERSION=%APP_VERSION% ^
                --build-arg BUILD_NUMBER=%BUILD_NUMBER% ^
                --build-arg ENVIRONMENT=Kubernetes ^
                -t %DOCKERHUB_REPO%:%BUILD_NUMBER% .
                """
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: env.DOCKERHUB_CREDENTIALS_ID,
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_PASS'
                    )
                ]) {
                    bat """
                    echo %DOCKERHUB_PASS% | docker login -u %DOCKERHUB_USER% --password-stdin
                    docker push %DOCKERHUB_REPO%:%BUILD_NUMBER%
                    docker push %DOCKERHUB_REPO_BACKEND%:%BUILD_NUMBER%
                    """
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(
                        credentialsId: env.KUBECONFIG_CREDENTIALS_ID,
                        variable: 'KUBECONFIG_FILE'
                    )
                ]) {
                    bat """
                    set KUBECONFIG=%KUBECONFIG_FILE%
                    kubectl set image deployment/portfolio portfolio=%DOCKERHUB_REPO%:%BUILD_NUMBER%
                    kubectl set image deployment/portfolio-backend portfolio-backend=%DOCKERHUB_REPO_BACKEND%:%BUILD_NUMBER%
                    kubectl rollout status deployment/portfolio
                    kubectl rollout status deployment/portfolio-backend
                    """
                }
            }
        }
    }
}
