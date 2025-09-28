resource "aws_s3_bucket" "frontend_bucket" {
    bucket = var.bucket_name

    tags = {
        Name = "StackIt Frontend"
        Project = "StackIt"
    }
}

resource "aws_ecr_repository" "backend_repo"{
    name = var.ecr_repo_name

    tags = {
        Name = "StackIt Backend Repo"
        Project = "StackIt"
    }
}

