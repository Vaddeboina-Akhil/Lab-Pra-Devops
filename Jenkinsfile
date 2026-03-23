pipeline {
  agent any

  environment {
    DOCKERHUB_CREDENTIALS_ID = 'dockerhub-creds'
    KUBECONFIG_CREDENTIALS_ID = 'kubeconfig-creds'
    DOCKERHUB_REPO = '23p61a05m5/portfolio'
    DOCKERHUB_REPO_BACKEND = '23p61a05m5/portfolio-backend'
  }

  triggers {
    pollSCM('* * * * *')
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
          sh 'npm install'
          sh 'npm run build'
        }
      }
    }

    stage('Build Backend Docker Image') {
      steps {
        dir('backend') {
          sh "docker build -t ${DOCKERHUB_REPO_BACKEND}:${BUILD_NUMBER} ."
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        script {
          def version = "v1.0.${env.BUILD_NUMBER}"
          def deployTime = sh(
            script: "date -u +\"%Y-%m-%dT%H:%M:%SZ\"",
            returnStdout: true
          ).trim()

          env.APP_VERSION = version
          env.DEPLOY_TIME = deployTime

          sh """
            docker build \\
              --build-arg APP_VERSION=${APP_VERSION} \\
              --build-arg BUILD_NUMBER=${BUILD_NUMBER} \\
              --build-arg DEPLOY_TIME=${DEPLOY_TIME} \\
              --build-arg ENVIRONMENT=Kubernetes \\
              -t ${DOCKERHUB_REPO}:${BUILD_NUMBER} .
          """
        }
      }
    }

    stage('Push Docker Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
          sh """
            echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
            docker push ${DOCKERHUB_REPO}:${BUILD_NUMBER}
          """
        }
      }
    }

    stage('Push Backend Docker Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: DOCKERHUB_CREDENTIALS_ID, usernameVariable: 'DOCKERHUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
          sh """
            echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
            docker push ${DOCKERHUB_REPO_BACKEND}:${BUILD_NUMBER}
          """
        }
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        withCredentials([file(credentialsId: KUBECONFIG_CREDENTIALS_ID, variable: 'KUBECONFIG_FILE')]) {
          sh """
            export KUBECONFIG=${KUBECONFIG_FILE}
            kubectl set image deployment/portfolio portfolio=${DOCKERHUB_REPO}:${BUILD_NUMBER} --record
            kubectl set image deployment/portfolio-backend portfolio-backend=${DOCKERHUB_REPO_BACKEND}:${BUILD_NUMBER} --record
            kubectl rollout status deployment/portfolio
            kubectl rollout status deployment/portfolio-backend
          """
        }
      }
    }
  }
}

