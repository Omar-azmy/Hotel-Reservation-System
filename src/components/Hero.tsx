import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 to-charcoal/70"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
          Welcome to City Business Hotel
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
          Premium accommodation in the heart of the city. Where comfort meets sophistication.
        </p>
        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
          <Link to="/rooms">
            Explore Rooms
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Hero;