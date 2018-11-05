---
layout: post
title: First-Class Polymorphic Methods in Go
---

In Go, functions are first-class, but methods are also first class. Even more so than in some other languages. In Go, we have first-class polymorphic dispatch.

## Regular Methods

We can call regular methods on a struct like this:

```Go
type Person struct {
  name string
}

func (p Person) Greet() {
  fmt.Println("Hello,", p.name)
}

Person{"Bill"}.Greet()
```

## First-Class Methods

But we can also grab one of the methods of a struct, save it, and pass it around to be called later. That looks like this:

```Go
greeter := Person{"Bill"}.Greet
greeter()
```

## Unbound First-Class Methods

But what if we don't know the exact object we want to call this method on yet? We can get the method directly from the struct's type. In this instance the type of greeter will be ```func(p Person)```. The method receiver becomes the first argument.

```Go
greeter := Person.Greet
greeter(Person{"Bill"})
```

## Polymorphic First-Class Methods

But, even further, what if we don't even know the type of the receiver we want to call this method on? We can get the method directly from an interface. In this case the type of greeter will be ```func(Greetable)```. We can save this polymorphic "method" (where the receiver is now the first argument), pass it as an argument to other functions, store it as a field on a struct, and call it later on some instance of ```Greetable```.

```Go
type Greetable interface {
  Greet()
}

type GermanPerson struct {
  name string
}
func (p GermanPerson) Greet() {
  fmt.Println("Guten Tag,", p.name)
}

greeter := Greetable.Greet
greeter(Person{"Bill"})
greeter(GermanPerson{"Dieter"})
```
