#to create our isolated network
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "StackIt-VPC"
  }
}

#public subnet in vpc with 24 bit mask for servers,etc like internet-faciing things so that the user can make api calls to ec2
#1st public subnet in az-a
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a" 
  map_public_ip_on_launch = true 
  tags = {
    Name = "StackIt-Public-Subnet-A" 
  }
}

#2nd public subnet in az- b
resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"   #diff address range
  availability_zone       = "ap-south-1b"  
  map_public_ip_on_launch = true
  tags = {
    Name = "StackIt-Public-Subnet-B"
  }
}

#connects our vpc to  internet
resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.main.id
  tags   = {
    Name = "StackIt-IGW"
  }
}

#route table to route traffic from subnert to internet gateway
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }

  tags = {
    Name = "StackIt-Public-RT"
  }
}

#associates route table with public subnet
resource "aws_route_table_association" "public_assoc" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public_rt.id
}