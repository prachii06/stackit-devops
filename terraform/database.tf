#firewall to protect database
resource "aws_security_group" "rds_sg" {
  name   = "stackit-rds-sg"
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "stackit rds firewall"
  }
}

#tells rds that in which subnets it can be placed in
resource "aws_db_subnet_group" "stackit_db_subnet_group" {
  name       = "stackit-db-subnet-group"
  subnet_ids = [aws_subnet.public.id,aws_subnet.public_b.id]

  tags = {
    Name = "stackit db subnet group"
  }
}

#postgres database instance
resource "aws_db_instance" "stackit_db" {
  identifier_prefix      = "stackit-db"
  engine                 = "postgres"
  instance_class         = "db.t4g.micro"
  allocated_storage      = 20
  username               = var.db_username
  password               = var.db_password
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.stackit_db_subnet_group.id
  publicly_accessible    = false
  skip_final_snapshot    = true  #avoids finalbackup on deletion- useful for faster deletion during testing
}